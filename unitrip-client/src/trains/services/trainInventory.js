/**
 * Railway inventory boundary.
 * `mockTrainInventory` reads the sample timetable only.
 * Replace `trainInventory.provider` with an authorised railway API adapter
 * that returns the same search shape. Do not treat mock results as live seats.
 */
import { TRAIN_DATA_SOURCE, SAMPLE_DISCLAIMER, findTrains } from "./trainSearch";

export const mockTrainInventory = {
  name: "mock",
  async search(criteria) {
    return {
      source: TRAIN_DATA_SOURCE,
      disclaimer: SAMPLE_DISCLAIMER,
      trains: findTrains(criteria),
    };
  },
};

export const trainInventory = {
  provider: mockTrainInventory,

  async search(criteria) {
    return this.provider.search(criteria);
  },
};
