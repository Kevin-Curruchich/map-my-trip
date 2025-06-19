import type { TripRepository } from "~/repositories/trip.repository";

export class TripService {
  constructor(private tripRepository: TripRepository) {}

  async getUserTrips(userId: string) {
    return await this.tripRepository.findByUserId(userId);
  }
}
