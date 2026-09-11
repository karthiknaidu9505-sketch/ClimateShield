import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthenticatedRequest, isAuthorizedForJurisdiction } from '../middlewares/authMiddleware.js';

export const getRiskHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const requestedJurisdictionId = req.query.jurisdictionId as string | undefined;
    const targetJurisdictionId = requestedJurisdictionId || req.user?.primaryJurisdictionId || 'jur-amalapuram-region';

    // IDOR Authorization Check
    if (!isAuthorizedForJurisdiction(req, targetJurisdictionId)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: You are not authorized to view risk history for jurisdiction '${targetJurisdictionId}'.`
      });
    }

    const historicalRecord = await prisma.historicalRiskData.findFirst({
      where: { jurisdictionId: targetJurisdictionId },
      orderBy: { year: 'desc' }
    });

    if (historicalRecord) {
      return res.json({
        success: true,
        jurisdictionId: targetJurisdictionId,
        summary: historicalRecord.summaryMetrics,
        capitalDirective: historicalRecord.capitalDirective,
        monthlyTrends: historicalRecord.monthlyTrends,
        recurringHotspots: historicalRecord.recurringHotspots
      });
    }

    return res.status(404).json({
      success: false,
      error: `No historical risk analytics found for jurisdiction '${targetJurisdictionId}'.`
    });
  } catch (error: any) {
    console.error('Error in getRiskHistory:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch risk history analytics.' });
  }
};
