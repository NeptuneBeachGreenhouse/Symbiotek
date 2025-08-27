'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPlants, refreshPlantData, subscribeToPlantReadings, type Plant } from '@/lib/plant-data';
import { getSensorThresholds, getCurrentThreshold, type SensorThreshold } from '@/lib/sensor-utils';
import AuthButton from '@/components/AuthButton';
import ChatBox from '@/components/ChatBox';
import AddPlantForm from '@/components/AddPlantForm';

// Using Plant type from plant-data.ts

export default function Home() {
  const { user, loading } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [lightThresholds, setLightThresholds] = useState<SensorThreshold[]>([]);
  const [moistureThresholds, setMoistureThresholds] = useState<SensorThreshold[]>([]);

  // Load thresholds when selected plant changes
  useEffect(() => {
    if (selectedPlant) {
      // Load light thresholds
      getSensorThresholds('light', selectedPlant.plant_type_id)
        .then(setLightThresholds)
        .catch(console.error);

      // Load moisture thresholds
      getSensorThresholds('soil_moisture', selectedPlant.plant_type_id)
        .then(setMoistureThresholds)
        .catch(console.error);
    }
  }, [selectedPlant?.plant_type_id]);

  // Load plants when user changes
  useEffect(() => {
    if (user) {
      // Load user's plants
      getUserPlants().then(plants => {
        setPlants(plants);
        if (plants.length > 0) {
          setSelectedPlant(plants[0]);
        }
      });
    }
  }, [user]);

  // Simulate new readings every 30 seconds
  useEffect(() => {
    if (!selectedPlant) return;

    const interval = setInterval(() => {
      refreshPlantData(selectedPlant.id);
    }, 30000);

    // Subscribe to real-time updates
    const unsubscribe = subscribeToPlantReadings(selectedPlant.id, (readings) => {
      setSelectedPlant(prev => prev ? { ...prev, latest_readings: readings } : null);
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [selectedPlant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECF0F3] flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ECF0F3] p-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Header with Auth */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome, {user?.email || 'Guest'}
            </h1>
            {plants.length > 0 ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedPlant?.id || ''}
                  onChange={(e) => {
                    const plant = plants.find(p => p.id === e.target.value);
                    setSelectedPlant(plant || null);
                  }}
                  className="text-lg text-gray-700 border border-gray-300 rounded-md px-2 py-1"
                >
                  {plants.map(plant => (
                    <option key={plant.id} value={plant.id}>
                      {plant.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-gray-600">No plants yet. Add one below!</p>
            )}
          </div>
          <AuthButton />
        </div>

        {/* Add Plant Form */}
        <div className="mb-8">
          <AddPlantForm onPlantCreated={() => getUserPlants().then(setPlants)} />
        </div>

        {/* Sensor Data */}
        <div className="space-y-6">
          {selectedPlant?.latest_readings?.filter(reading => 
            reading.sensor_type === 'soil_moisture' || reading.sensor_type === 'light'
          ).map(reading => {
            const isWater = reading.sensor_type === 'soil_moisture';
            const thresholds = isWater ? moistureThresholds : lightThresholds;
            const currentThreshold = getCurrentThreshold(reading.value, thresholds);
            
            if (!currentThreshold || thresholds.length === 0) {
              return null; // Don't render if we don't have thresholds yet
            }
            
            return (
              <div key={reading.sensor_type} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <span className="text-gray-600 font-medium block">
                      {isWater ? 'Water Level' : 'Light Level'}
                    </span>
                    <span className={`text-${currentThreshold.color}-600 font-bold text-lg`}>
                      {currentThreshold.label}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-gray-700">
                    {Math.round(reading.value)}%
                  </span>
                </div>
                <div className="relative">
                  <div className="flex h-2 mb-1">
                    {thresholds.map((threshold, index) => (
                      <div
                        key={threshold.level}
                        className={`flex-1 ${index > 0 ? 'ml-0.5' : ''}`}
                        style={{ 
                          flexGrow: threshold.max_value - threshold.min_value 
                        }}
                      >
                        <div className={`h-full bg-${threshold.color}-200 rounded-sm`} />
                      </div>
                    ))}
                  </div>
                  <div 
                    className={`absolute top-0 h-2 bg-${currentThreshold.color}-600 rounded-full transition-all duration-500 w-2`}
                    style={{ 
                      left: `${reading.value}%`,
                      transform: 'translateX(-50%)'
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Box */}
        <div className="mt-8">
          <ChatBox plantName={selectedPlant?.name || 'Plant'} />
        </div>
      </div>
    </div>
  );
}
