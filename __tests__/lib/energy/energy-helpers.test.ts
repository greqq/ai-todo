import {
  getTimeOfDay,
  calculateEnergyCurve,
  calculateTimeOfDayEnergy,
  getEnergyHeatmap,
  getPeakEnergyTime,
  calculateEnergyTrend,
  getOptimalTaskTime,
  type EnergyLog,
  type EnergyCurve,
} from '@/lib/energy/energy-helpers';

describe('Energy Helper Functions', () => {
  describe('getTimeOfDay', () => {
    it('should return early_morning for hours 4-6', () => {
      const date = new Date('2024-01-01T05:00:00');
      expect(getTimeOfDay(date)).toBe('early_morning');
    });

    it('should return morning for hours 7-11', () => {
      const date = new Date('2024-01-01T09:00:00');
      expect(getTimeOfDay(date)).toBe('morning');
    });

    it('should return midday for hours 12-14', () => {
      const date = new Date('2024-01-01T13:00:00');
      expect(getTimeOfDay(date)).toBe('midday');
    });

    it('should return afternoon for hours 15-17', () => {
      const date = new Date('2024-01-01T16:00:00');
      expect(getTimeOfDay(date)).toBe('afternoon');
    });

    it('should return evening for hours 18-21', () => {
      const date = new Date('2024-01-01T20:00:00');
      expect(getTimeOfDay(date)).toBe('evening');
    });

    it('should return night for hours 22-3', () => {
      const date = new Date('2024-01-01T23:00:00');
      expect(getTimeOfDay(date)).toBe('night');
    });

    it('should handle string timestamps', () => {
      expect(getTimeOfDay('2024-01-01T09:00:00')).toBe('morning');
    });
  });

  describe('calculateEnergyCurve', () => {
    it('should calculate average energy for each hour', () => {
      const logs: EnergyLog[] = [
        {
          id: '1',
          user_id: 'user1',
          timestamp: '2024-01-01T09:00:00',
          energy_level: 8,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
        {
          id: '2',
          user_id: 'user1',
          timestamp: '2024-01-01T09:30:00',
          energy_level: 6,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
      ];

      const curve = calculateEnergyCurve(logs);
      expect(curve).toHaveLength(24);
      expect(curve[9]).toEqual({
        hour: 9,
        average_energy: 7,
        sample_count: 2,
      });
    });

    it('should return 0 for hours with no data', () => {
      const logs: EnergyLog[] = [];
      const curve = calculateEnergyCurve(logs);
      expect(curve).toHaveLength(24);
      expect(curve[0]).toEqual({
        hour: 0,
        average_energy: 0,
        sample_count: 0,
      });
    });

    it('should handle logs from different hours', () => {
      const logs: EnergyLog[] = [
        {
          id: '1',
          user_id: 'user1',
          timestamp: '2024-01-01T09:00:00',
          energy_level: 8,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
        {
          id: '2',
          user_id: 'user1',
          timestamp: '2024-01-01T14:00:00',
          energy_level: 5,
          time_of_day: 'midday',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
      ];

      const curve = calculateEnergyCurve(logs);
      expect(curve[9].average_energy).toBe(8);
      expect(curve[14].average_energy).toBe(5);
    });
  });

  describe('calculateTimeOfDayEnergy', () => {
    it('should calculate average energy for each time period', () => {
      const logs: EnergyLog[] = [
        {
          id: '1',
          user_id: 'user1',
          timestamp: '2024-01-01T09:00:00',
          energy_level: 8,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
        {
          id: '2',
          user_id: 'user1',
          timestamp: '2024-01-01T10:00:00',
          energy_level: 6,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
        {
          id: '3',
          user_id: 'user1',
          timestamp: '2024-01-01T20:00:00',
          energy_level: 4,
          time_of_day: 'evening',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
      ];

      const result = calculateTimeOfDayEnergy(logs);
      expect(result.morning).toBe(7);
      expect(result.evening).toBe(4);
      expect(result.midday).toBe(0);
    });

    it('should return 0 for periods with no data', () => {
      const logs: EnergyLog[] = [];
      const result = calculateTimeOfDayEnergy(logs);
      expect(result).toEqual({
        early_morning: 0,
        morning: 0,
        midday: 0,
        afternoon: 0,
        evening: 0,
        night: 0,
      });
    });
  });

  describe('getEnergyHeatmap', () => {
    it('should create heatmap data with date, hour, and energy level', () => {
      const logs: EnergyLog[] = [
        {
          id: '1',
          user_id: 'user1',
          timestamp: '2024-01-01T09:00:00',
          energy_level: 8,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
        {
          id: '2',
          user_id: 'user1',
          timestamp: '2024-01-01T09:30:00',
          energy_level: 6,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
      ];

      const heatmap = getEnergyHeatmap(logs);
      expect(heatmap).toHaveLength(1);
      expect(heatmap[0]).toEqual({
        date: '2024-01-01',
        hour: 9,
        energy_level: 7,
      });
    });

    it('should average multiple logs for same date and hour', () => {
      const logs: EnergyLog[] = [
        {
          id: '1',
          user_id: 'user1',
          timestamp: '2024-01-01T09:15:00',
          energy_level: 10,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
        {
          id: '2',
          user_id: 'user1',
          timestamp: '2024-01-01T09:45:00',
          energy_level: 6,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
      ];

      const heatmap = getEnergyHeatmap(logs);
      expect(heatmap[0].energy_level).toBe(8);
    });
  });

  describe('getPeakEnergyTime', () => {
    it('should return the time period with highest average energy', () => {
      const logs: EnergyLog[] = [
        {
          id: '1',
          user_id: 'user1',
          timestamp: '2024-01-01T09:00:00',
          energy_level: 8,
          time_of_day: 'morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
        {
          id: '2',
          user_id: 'user1',
          timestamp: '2024-01-01T14:00:00',
          energy_level: 5,
          time_of_day: 'midday',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
      ];

      expect(getPeakEnergyTime(logs)).toBe('morning');
    });

    it('should return null for empty logs', () => {
      expect(getPeakEnergyTime([])).toBeNull();
    });

    it('should handle early_morning correctly', () => {
      const logs: EnergyLog[] = [
        {
          id: '1',
          user_id: 'user1',
          timestamp: '2024-01-01T05:00:00',
          energy_level: 10,
          time_of_day: 'early_morning',
          context: null,
          task_id: null,
          task_was_energizing: null,
        },
      ];

      expect(getPeakEnergyTime(logs)).toBe('early morning');
    });
  });

  describe('calculateEnergyTrend', () => {
    it('should detect improving trend', () => {
      const logs: EnergyLog[] = Array.from({ length: 14 }, (_, i) => ({
        id: String(i),
        user_id: 'user1',
        timestamp: new Date(2024, 0, i + 1).toISOString(),
        energy_level: i < 7 ? 5 : 8,
        time_of_day: 'morning',
        context: null,
        task_id: null,
        task_was_energizing: null,
      }));

      const result = calculateEnergyTrend(logs);
      expect(result.trend).toBe('improving');
      expect(result.change).toBeGreaterThan(0);
    });

    it('should detect declining trend', () => {
      const logs: EnergyLog[] = Array.from({ length: 14 }, (_, i) => ({
        id: String(i),
        user_id: 'user1',
        timestamp: new Date(2024, 0, i + 1).toISOString(),
        energy_level: i < 7 ? 8 : 5,
        time_of_day: 'morning',
        context: null,
        task_id: null,
        task_was_energizing: null,
      }));

      const result = calculateEnergyTrend(logs);
      expect(result.trend).toBe('declining');
      expect(result.change).toBeLessThan(0);
    });

    it('should detect stable trend for small changes', () => {
      const logs: EnergyLog[] = Array.from({ length: 14 }, (_, i) => ({
        id: String(i),
        user_id: 'user1',
        timestamp: new Date(2024, 0, i + 1).toISOString(),
        energy_level: 7,
        time_of_day: 'morning',
        context: null,
        task_id: null,
        task_was_energizing: null,
      }));

      const result = calculateEnergyTrend(logs);
      expect(result.trend).toBe('stable');
      expect(result.change).toBe(0);
    });

    it('should return stable for insufficient data', () => {
      const logs: EnergyLog[] = Array.from({ length: 5 }, (_, i) => ({
        id: String(i),
        user_id: 'user1',
        timestamp: new Date(2024, 0, i + 1).toISOString(),
        energy_level: 7,
        time_of_day: 'morning',
        context: null,
        task_id: null,
        task_was_energizing: null,
      }));

      const result = calculateEnergyTrend(logs);
      expect(result.trend).toBe('stable');
      expect(result.change).toBe(0);
    });
  });

  describe('getOptimalTaskTime', () => {
    const sampleCurve: EnergyCurve[] = [
      { hour: 9, average_energy: 8, sample_count: 5 },
      { hour: 14, average_energy: 5, sample_count: 4 },
      { hour: 18, average_energy: 3, sample_count: 3 },
    ];

    it('should return highest energy hour for high energy tasks', () => {
      const result = getOptimalTaskTime('high', sampleCurve);
      expect(result).toBeTruthy();
      expect(result?.hour).toBe(9);
    });

    it('should return medium energy hour for medium energy tasks', () => {
      const result = getOptimalTaskTime('medium', sampleCurve);
      expect(result).toBeTruthy();
      expect(result?.hour).toBe(14);
    });

    it('should return lowest energy hour for low energy tasks', () => {
      const result = getOptimalTaskTime('low', sampleCurve);
      expect(result).toBeTruthy();
      expect(result?.hour).toBe(18);
    });

    it('should return null for empty curve', () => {
      const result = getOptimalTaskTime('high', []);
      expect(result).toBeNull();
    });

    it('should filter hours with insufficient samples', () => {
      const curveLowSamples: EnergyCurve[] = [
        { hour: 9, average_energy: 8, sample_count: 1 },
        { hour: 14, average_energy: 5, sample_count: 0 },
      ];

      const result = getOptimalTaskTime('high', curveLowSamples);
      expect(result).toBeNull();
    });
  });
});
