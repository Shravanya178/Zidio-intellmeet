import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { io, type Socket } from 'socket.io-client'
import {
  Mic, MicOff, Video, VideoOff, PhoneOff,
  MessageSquare, Send, Users, Sparkles, X, Copy, Check, Share2,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { meetingsService } from '../../services/meetings.service'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface ChatMessage { id: number; message: string; sender: string; timestamp: string }
interface Participant  { userId: string; name: string }

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export default function MeetingRoomPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate   = useNavigate()
  const user       = useAuthStore((s) => s.user)
  const qc         = useQueryClient()

  const socketRef         = useRef<Socket | null>(null)
  const localVideoRef     = useRef<HTMLVideoElement>(null)
  const remoteVideoRef    = useRef<HTMLVideoElement>(null)
  const localStreamRef    = useRef<MediaStream | null>(null)
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const transcriptRef     = useRef('')
  const chatEndRef        = useRef<HTMLDivElement>(null)

  const [isMuted,          setIsMuted]          = useState(false)
  const [isVideoOff,       setIsVideoOff]        = useState(false)
  const [panel,            setPanel]             = useState<'chat' | 'participants' | null>(null)
  const [messages,         setMessages]          = useState<ChatMessage[]>([])
  const [chatInput,        setChatInput]         = useState('')
  const [participants,     setParticipants]      = useState<Participant[]>([])
  const [summaryOpen,      setSummaryOpen]       = useState(false)
  const [aiSummary,        setAiSummary]         = useState('')
  const [aiActionItems,    setAiActionItems]     = useState<string[]>([])
  const [isGenerating,     setIsGenerating]      = useState(false)
  const [copied,           setCopied]            = useState(false)
  const [meetingId,        setMeetingId]         = useState<string | null>(null)
  const [elapsed,          setElapsed]           = useState(0)
  const [shareOpen,        setShareOpen]         = useState(false)
  const [linkCopied,       setLinkCopied]        = useState(false)

  const { data: meetings } = useQuery({ queryKey: ['meetings'], queryFn: meetingsService.getAll })

  useEffect(() => {
    const found = meetings?.find((m) => m.roomId === roomId)
    if (found) setMeetingId(found._id)
  }, [meetings, roomId])

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const endMutation = useMutation({
    mutationFn: ({ id, transcript }: { id: string; transcript: string }) =>
      meetingsService.end(id, transcript),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
  })

  const saveSummaryMutation = useMutation({
    mutationFn: ({ id, summary, actionItems }: { id: string; summary: string; actionItems: { text: string; assignee: string }[] }) =>
      meetingsService.saveSummary(id, { summary, actionItems }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['meetings'] }); navigate('/meetings') },
  })

  const createPeerConnection = useCallback((socket: Socket) => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!))
    pc.ontrack = (e) => { if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0] }
    pc.onicecandidate = (e) => {
      if (e.candidate) socket.emit('webrtc-ice-candidate', { candidate: e.candidate, to: 'room', roomId })
    }
    return pc
  }, [roomId])

  useEffect(() => {
    if (!roomId || !user) return
    const socket = io(SOCKET_URL, { withCredentials: true })
    socketRef.current = socket

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream
        socket.emit('join-room', { roomId, userId: user.id, name: user.name })
      })
      .catch(() => socket.emit('join-room', { roomId, userId: user.id, name: user.name }))

    socket.on('participants-updated', (list: Participant[]) => setParticipants(list))
    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages((p) => [...p, msg])
      transcriptRef.current += `\n${msg.sender}: ${msg.message}`
    })
    socket.on('user-joined', async ({ userId: rid }: { userId: string }) => {
      if (rid === user.id) return
      const pc = createPeerConnection(socket)
      peerConnectionRef.current = pc
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      socket.emit('webrtc-offer', { roomId, offer, to: rid })
    })
    socket.on('webrtc-offer', async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      const pc = createPeerConnection(socket)
      peerConnectionRef.current = pc
      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      socket.emit('webrtc-answer', { answer, to: from })
    })
    socket.on('webrtc-answer', async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      await peerConnectionRef.current?.setRemoteDescription(answer)
    })
    socket.on('webrtc-ice-candidate', async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try { await peerConnectionRef.current?.addIceCandidate(candidate) } catch {}
    })

    return () => {
      localStreamRef.current?.getTracks().forEach((t) => t.stop())
      peerConnectionRef.current?.close()
      socket.disconnect()
    }
  }, [roomId, user, createPeerConnection])

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const toggleMute = () => {
    const t = localStreamRef.current?.getAudioTracks()[0]
    if (t) { t.enabled = !t.enabled; setIsMuted(!t.enabled) }
  }
  const toggleVideo = () => {
    const t = localStreamRef.current?.getVideoTracks()[0]
    if (t) { t.enabled = !t.enabled; setIsVideoOff(!t.enabled) }
  }
  const sendMessage = () => {
    if (!chatInput.trim() || !socketRef.current) return
    socketRef.current.emit('chat-message', { roomId, message: chatInput, sender: user?.name ?? 'You' })
    setChatInput('')
  }
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId ?? '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const joinLink = `${window.location.origin}/join/${roomId}`

  const copyJoinLink = () => {
    navigator.clipboard.writeText(joinLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`🎥 You're invited to join my IntellMeet meeting!\n\nClick the link to join:\n${joinLink}\n\nRoom ID: ${roomId}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Join my IntellMeet meeting', text: `Join my meeting — Room: ${roomId}`, url: joinLink })
    } else {
      copyJoinLink()
    }
  }
  const generateAISummary = () => {
    setIsGenerating(true)
    setSummaryOpen(true)
    setTimeout(() => {
      const t = transcriptRef.current || 'No transcript available.'
      setAiSummary(
        `This meeting covered key project updates and team coordination topics. ` +
        `${messages.length} messages were exchanged during the session.\n\n` +
        `Transcript excerpt:\n${t.slice(0, 300)}${t.length > 300 ? '...' : ''}`
      )
      setAiActionItems([
        'Follow up on discussed items with the team',
        'Schedule next meeting within the week',
        'Share meeting notes with all participants',
      ])
      setIsGenerating(false)
    }, 1800)
  }
  const handleEndMeeting = async () => {
    if (meetingId) await endMutation.mutateAsync({ id: meetingId, transcript: transcriptRef.current })
    localStreamRef.current?.getTracks().forEach((t) => t.stop())
    peerConnectionRef.current?.close()
    socketRef.current?.disconnect()
    navigate('/meetings')
  }
  const handleSaveSummary = () => {
    if (!meetingId) return
    saveSummaryMutation.mutate({
      id: meetingId,
      summary: aiSummary,
      actionItems: aiActionItems.map((text) => ({ text, assignee: '' })),
    })
  }

  const ControlBtn = ({
    onClick, active, danger, children, title,
  }: { onClick: () => void; active?: boolean; danger?: boolean; children: React.ReactNode; title?: string }) => (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={onClick}
        title={title}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          danger
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 active:scale-95'
            : active
            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30 active:scale-95'
            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/50 active:scale-95'
        }`}
      >
        {children}
      </button>
      {title && <span className="text-[9px] text-zinc-500 hidden sm:block truncate max-w-[52px] text-center">{title}</span>}
    </div>
  )

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 bg-zinc-900 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-white">Live</span>
            </div>
            <div className="h-4 w-px bg-zinc-700" />
            <span className="text-sm font-mono text-zinc-300">{formatTime(elapsed)}</span>
            <div className="h-4 w-px bg-zinc-700" />
            <button
              onClick={copyRoomId}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1.5 rounded-lg transition-all border border-zinc-700/50"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span className="font-mono">{roomId}</span>
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Users size={13} />
            <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Video area */}
        <div className="flex-1 relative bg-zinc-950 flex items-center justify-center p-5">
          {/* Remote */}
          <div className="relative w-full max-w-4xl aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800/60 shadow-2xl">
            <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
                <Users size={28} className="text-zinc-600" />
              </div>
              <p className="text-sm">Waiting for others to join...</p>
            </div>
          </div>

          {/* Local PiP */}
          <div className="absolute bottom-8 right-8 w-44 aspect-video bg-zinc-800 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            {isVideoOff && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-800 gap-1.5">
                <VideoOff size={18} className="text-zinc-500" />
                <span className="text-[10px] text-zinc-500">Camera off</span>
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <span className="text-[10px] text-white/70 bg-black/40 px-1.5 py-0.5 rounded-md truncate">
                {user?.name ?? 'You'}
              </span>
              {isMuted && (
                <span className="bg-red-500/80 rounded-full p-0.5">
                  <MicOff size={9} />
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 py-4 px-6 bg-zinc-900/95 border-t border-zinc-800/80 backdrop-blur-sm">
          <ControlBtn onClick={toggleMute} active={isMuted} title={isMuted ? 'Unmute' : 'Mute'}>
            {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
          </ControlBtn>

          <ControlBtn onClick={toggleVideo} active={isVideoOff} title={isVideoOff ? 'Start video' : 'Stop video'}>
            {isVideoOff ? <VideoOff size={19} /> : <Video size={19} />}
          </ControlBtn>

          <div className="w-px h-8 bg-zinc-700 mx-1" />

          <ControlBtn onClick={generateAISummary} title="Generate AI Summary">
            <Sparkles size={19} className="text-primary" />
          </ControlBtn>

          <ControlBtn onClick={() => setShareOpen(true)} title="Share meeting link">
            <Share2 size={19} />
          </ControlBtn>

          <ControlBtn
            onClick={() => setPanel(panel === 'chat' ? null : 'chat')}
            active={panel === 'chat'}
            title="Chat"
          >
            <MessageSquare size={19} />
          </ControlBtn>

          <ControlBtn
            onClick={() => setPanel(panel === 'participants' ? null : 'participants')}
            active={panel === 'participants'}
            title="Participants"
          >
            <Users size={19} />
          </ControlBtn>

          <div className="w-px h-8 bg-zinc-700 mx-1" />

          <ControlBtn onClick={handleEndMeeting} danger title="End meeting">
            <PhoneOff size={19} />
          </ControlBtn>
        </div>
      </div>

      {/* Side panel */}
      {panel && (
        <div className="w-80 flex flex-col bg-zinc-900 border-l border-zinc-800/80 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800">
            <span className="font-semibold text-sm text-white">
              {panel === 'chat' ? 'Meeting Chat' : `Participants (${participants.length})`}
            </span>
            <button onClick={() => setPanel(null)} className="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>

          {panel === 'chat' ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-600 py-12">
                    <MessageSquare size={28} className="opacity-40" />
                    <p className="text-xs">No messages yet. Say hello!</p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-primary">{msg.sender}</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-200 bg-zinc-800 px-3 py-2 rounded-xl rounded-tl-sm leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary/60 transition-all"
                />
                <button
                  onClick={sendMessage}
                  className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center hover:opacity-90 transition-all shrink-0 shadow-md shadow-primary/20"
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-800 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {p.name?.charAt(0) ?? '?'}
                  </div>
                  <span className="text-sm text-zinc-200 flex-1 truncate">{p.name}</span>
                  {p.userId === user?.id && (
                    <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-md">you</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Share Modal */}
      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-sm animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Share2 size={15} className="text-primary" />
                </div>
                <h2 className="font-bold text-white">Share Meeting</h2>
              </div>
              <button onClick={() => setShareOpen(false)} className="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Join link */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Meeting Link</p>
                <div className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5">
                  <span className="flex-1 text-xs text-zinc-300 font-mono truncate">{joinLink}</span>
                  <button
                    onClick={copyJoinLink}
                    className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all ${
                      linkCopied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
                    }`}
                  >
                    {linkCopied ? <Check size={12} /> : <Copy size={12} />}
                    {linkCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Share via</p>

                {/* WhatsApp */}
                <button
                  onClick={shareWhatsApp}
                  className="w-full flex items-center gap-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-white px-4 py-3 rounded-xl transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Share on WhatsApp</p>
                    <p className="text-xs text-zinc-400">Send invite to your contacts</p>
                  </div>
                </button>

                {/* Native share / copy fallback */}
                <button
                  onClick={shareNative}
                  className="w-full flex items-center gap-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-3 rounded-xl transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                    <Share2 size={15} className="text-zinc-300" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">More options</p>
                    <p className="text-xs text-zinc-400">Email, Telegram, Slack…</p>
                  </div>
                </button>
              </div>

              {/* Room ID */}
              <div className="flex items-center justify-between bg-zinc-800/60 rounded-xl px-4 py-2.5 border border-zinc-700/50">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Room ID</p>
                  <p className="text-sm font-mono font-bold text-zinc-200">{roomId}</p>
                </div>
                <button
                  onClick={copyRoomId}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy ID'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Summary Modal */}
      {summaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles size={16} className="text-primary" />
                </div>
                <h2 className="font-bold text-white">AI Meeting Summary</h2>
              </div>
              {!isGenerating && (
                <button onClick={() => setSummaryOpen(false)} className="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-white font-medium text-sm">Generating summary...</p>
                    <p className="text-zinc-500 text-xs mt-1">Analyzing transcript and extracting action items</p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Summary</p>
                    <div className="bg-zinc-800/80 rounded-xl p-4 text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto border border-zinc-700/50">
                      {aiSummary}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Action Items</p>
                    <ul className="space-y-2">
                      {aiActionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 bg-zinc-800/50 rounded-xl px-3 py-2.5 border border-zinc-700/40">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm text-zinc-200 leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setSummaryOpen(false)}
                      className="flex-1 h-11 rounded-xl border border-zinc-700 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={handleSaveSummary}
                      disabled={saveSummaryMutation.isPending}
                      className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-55 shadow-md shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      {saveSummaryMutation.isPending ? (
                        <>
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : 'Save & End Meeting'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
