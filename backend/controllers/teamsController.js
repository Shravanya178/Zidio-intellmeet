const crypto = require("crypto");
const Team = require("../models/Team");
const TeamInvitation = require("../models/TeamInvitation");

const createTeam = async (req, res, next) => {
  try {
    const { name } = req.body || {};
    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    const team = await Team.create({
      name,
      owner: req.user.id,
      members: [{ user: req.user.id, role: "admin" }],
    });

    return res.status(201).json({ team });
  } catch (error) {
    return next(error);
  }
};

const inviteToTeam = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { email } = req.body || {};

    if (!email) {
      return res.status(400).json({ message: "Invite email is required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isOwner = team.owner.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await TeamInvitation.create({
      team: team._id,
      email,
      token,
      invitedBy: req.user.id,
      expiresAt,
    });

    return res.status(201).json({
      invitation: {
        id: invitation._id,
        teamId: team._id,
        email: invitation.email,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;
    const invitation = await TeamInvitation.findOne({ token });

    if (!invitation || invitation.status !== "pending") {
      return res.status(400).json({ message: "Invalid invitation" });
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      return res.status(400).json({ message: "Invitation expired" });
    }

    const team = await Team.findById(invitation.team);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const alreadyMember = team.members.some(
      (member) => member.user.toString() === req.user.id
    );

    if (!alreadyMember) {
      team.members.push({ user: req.user.id, role: "member" });
      await team.save();
    }

    invitation.status = "accepted";
    invitation.acceptedBy = req.user.id;
    await invitation.save();

    return res.json({ team });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTeam,
  inviteToTeam,
  acceptInvitation,
};
