import { Request, Response } from 'express';

export const getAdminDashboard = (req: Request, res: Response): void => {
  res.json({
    message: "Admin dashboard access granted",
    role: "admin",
    features: [
      "View all developer pages",
      "Approve or reject submitted pages",
      "Publish validated pages"
    ]
  });
};

export const getDeveloperDashboard = (req: Request, res: Response): void => {
  res.json({
    message: "Developer dashboard access granted",
    role: "user-developer",
    features: [
      "Create UI pages",
      "Preview pages",
      "Submit pages for validation"
    ]
  });
};
