import { apiService } from '@/services/api.service';
import { API_ENDPOINTS } from '@/config/api.config';

export type UserSkill = {
    id: string;
    skillType: string;
    proficiency: string;
    createdAt?: string | null;
    skill: { id: string; name: string; difficulty?: string | null };
};

export type AddUserSkillDto = {
    userId: string;
    skillId: string;
    skillType: string;      // 'TECHNICAL' | 'SOFT' | 'TOOL' (your choice)
    proficiency: string;    // 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
};

export const userSkillsApi = {
    async listMine(userId: string) {
        return apiService.get<UserSkill[]>(`${API_ENDPOINTS.USER_SKILLS}/me?userId=${userId}`);
    },
    async add(dto: AddUserSkillDto) {
        return apiService.post<UserSkill>(API_ENDPOINTS.USER_SKILLS, dto);
    },
    async remove(id: string) {
        return apiService.delete<void>(`${API_ENDPOINTS.USER_SKILLS}/${id}`);
    }
};
