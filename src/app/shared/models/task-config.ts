export class TeamMember {
  teamId: number;
  memberId: number;
  memberName: string;
  teamLeader: number;
}

export class TeamInfo {
  templateId: number;
  teamId: number;
  teamName: string;
  teamLeaderId: number;
  teamLeaderName: string;
  assignmentStatus: number;
  assignmentStatusName: string;
  teamMembers: TeamMember[];
  rank: number;
  templateName: string;
}
