import { prisma } from '../../config/db.js';

export class IncidentService {
  public static async getAllIncidents() {
    return prisma.incident.findMany({
      include: {
        location: true,
        responseTeam: true,
        actions: {
          orderBy: { order: 'asc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          take: 3
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async getIncidentById(id: string) {
    return prisma.incident.findFirst({
      where: {
        OR: [
          { id },
          { incidentNumber: id }
        ]
      },
      include: {
        location: {
          include: {
            assets: true,
            readings: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        },
        responseTeam: true,
        actions: {
          orderBy: { order: 'asc' }
        },
        notes: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
  }

  public static async createIncident(data: {
    locationId: string;
    title?: string;
    severity?: string;
    riskScore?: number;
    responseTeamId?: string;
    summary?: string;
  }) {
    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
      include: {
        readings: { orderBy: { timestamp: 'desc' }, take: 1 }
      }
    });

    if (!location) {
      throw new Error(`Location with id ${data.locationId} not found`);
    }

    const latestReading = location.readings[0] || {
      rainfallMm: 85,
      waterLevelCm: 42
    };

    const incidentCount = await prisma.incident.count();
    const incidentNumber = `INC-2024-${String(incidentCount + 90).padStart(3, '0')}`;

    // Find default team if none provided
    let teamId = data.responseTeamId;
    if (!teamId) {
      const defaultTeam = await prisma.responseTeam.findFirst();
      teamId = defaultTeam?.id;
    }

    const incident = await prisma.incident.create({
      data: {
        incidentNumber,
        locationId: data.locationId,
        responseTeamId: teamId,
        title: data.title || `${location.name} Flooding`,
        severity: data.severity || 'CRITICAL',
        riskScore: data.riskScore || 87,
        status: 'TEAM_ASSIGNED',
        waterLevelAtIncident: latestReading.waterLevelCm,
        rainfallAtIncident: latestReading.rainfallMm,
        summary: data.summary || `Automated dispatch initiated for ${location.name}. Water depth at ${latestReading.waterLevelCm}cm.`
      }
    });

    // Create default response actions
    await prisma.responseAction.createMany({
      data: [
        {
          incidentId: incident.id,
          title: 'Alert municipal emergency response team',
          description: 'Automated notification dispatched to rapid units',
          priority: 'Urgent',
          order: 1,
          isCompleted: true,
          completedAt: new Date()
        },
        {
          incidentId: incident.id,
          title: 'Inspect primary storm drain intakes for blockages',
          description: 'Field inspection of culverts and secondary outflow lines',
          priority: 'Urgent',
          order: 2,
          isCompleted: false
        },
        {
          incidentId: incident.id,
          title: 'Deploy mobile high-capacity water pumps',
          description: 'High-volume sump units positioned at low sump elevation',
          priority: 'High Priority',
          order: 3,
          isCompleted: false
        },
        {
          incidentId: incident.id,
          title: 'Restrict road access & activate dynamic detour signs',
          description: 'Deploy barricades and reroute transit traffic',
          priority: 'High Priority',
          order: 4,
          isCompleted: false
        },
        {
          incidentId: incident.id,
          title: 'Confirm water level recedes below 15cm & certify area safe',
          description: 'Engineering sign-off before reopening public corridor',
          priority: 'Standard',
          order: 5,
          isCompleted: false
        }
      ]
    });

    // Add initial log entry
    await prisma.incidentNote.create({
      data: {
        incidentId: incident.id,
        author: 'District Operations Command',
        role: 'OPERATIONS',
        message: `Incident declared for ${location.name}. Assigned to ${teamId ? 'Municipal Response Team A' : 'Pending Team'}.`
      }
    });

    return this.getIncidentById(incident.id);
  }

  public static async updateIncident(id: string, data: {
    status?: string;
    responseTeamId?: string;
    severity?: string;
  }) {
    const updateData: any = {};
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (data.responseTeamId) {
      updateData.responseTeamId = data.responseTeamId;
    }
    if (data.severity) {
      updateData.severity = data.severity;
    }

    const updated = await prisma.incident.update({
      where: { id },
      data: updateData
    });

    return this.getIncidentById(updated.id);
  }

  public static async toggleAction(actionId: string, isCompleted: boolean) {
    return prisma.responseAction.update({
      where: { id: actionId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });
  }

  public static async addNote(incidentId: string, author: string, message: string, role = 'OPERATIONS') {
    return prisma.incidentNote.create({
      data: {
        incidentId,
        author,
        message,
        role
      }
    });
  }
}
