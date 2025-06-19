import type { UserRepository } from "~/repositories/user.repository";
import type { UserProfile } from "~/types/domain";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return await this.userRepository.findById(userId);
  }

  async getUserProfileByExternalId(
    externalId: string
  ): Promise<UserProfile | null> {
    return await this.userRepository.findByExternalId(externalId);
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    return await this.userRepository.update(userId, updates);
  }
}
