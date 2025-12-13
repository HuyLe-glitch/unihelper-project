const staffRoleService = require('../services/staffRoleService');

exports.getAllRoles = async (req, res, next) => {
  try {
    const { department } = req.query; // Lấy department từ query params
    const roles = await staffRoleService.getAllRoles(department);
    res.status(200).json({ status: 'success', data: roles });
  } catch (err) {
    next(err);
  }
};

exports.getRoleById = async (req, res, next) => {
  try {
    const role = await staffRoleService.getRoleById(req.params.id);
    res.status(200).json({ status: 'success', data: role });
  } catch (err) {
    next(err);
  }
};

exports.createRole = async (req, res, next) => {
  try {
    const newRole = await staffRoleService.createRole(req.body);
    res.status(201).json({ status: 'success', data: newRole });
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const updated = await staffRoleService.updateRole(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    await staffRoleService.deleteRole(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};


