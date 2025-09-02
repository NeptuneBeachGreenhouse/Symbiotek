'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPlants, createPlant, updatePlant, deletePlant, getPlantHistory, addSensorReading } from '@/lib/plant-data';
import { Plant, PlantType, Personality } from '@/types';
import { CARE_THRESHOLDS } from '@/constants';
import { Card } from '@/components/Card';
import { Dashboard } from '@/components/Dashboard';
import { LeafIcon, PlusIcon, SparklesIcon, SunIcon, WaterDropIcon } from '@/components/icons';
import { HistoryChart } from '@/components/HistoryChart';
import AuthButton from '@/components/AuthButton';
import { AddPlantModal } from '@/components/AddPlantModal';
import { PlantChat } from '@/components/PlantChat';

// Helper function to get care advice
const getCareAdvice = (plantType?: PlantType, moisture?: number, light?: number) => {
  if (!plantType || typeof moisture !== 'number' || typeof light !== 'number') {
    return { advice: 'No Data', color: 'text-gray-400', icon: <SparklesIcon className="opacity-50" /> };
  }

  const thresholds = CARE_THRESHOLDS[plantType];
  if (!thresholds) {
    return { advice: 'Unknown Plant Type', color: 'text-gray-400', icon: <SparklesIcon className="opacity-50" /> };
  }

  if (moisture < thresholds.moisture.low) return { advice: 'Needs Water', color: 'text-blue-400', icon: <WaterDropIcon /> };
  if (moisture > thresholds.moisture.high) return { advice: 'Overwatered', color: 'text-blue-200', icon: <WaterDropIcon className="opacity-50"/> };
  if (light < thresholds.light.low) return { advice: 'Needs More Light', color: 'text-yellow-400', icon: <SunIcon /> };
  if (light > thresholds.light.high) return { advice: 'Too Much Light', color: 'text-orange-400', icon: <SunIcon className="opacity-50" /> };
  return { advice: 'Feeling Great!', color: 'text-green-400', icon: <SparklesIcon /> };
};

export default function Home() {
  const { user, loading } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [activePlantId, setActivePlantId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const activePlant = useMemo(() => plants.find(p => p.id === activePlantId), [plants, activePlantId]);

  // Load plants on initial load (including test plant for everyone)
  useEffect(() => {
    getUserPlants().then(async plants => {
      setPlants(plants);
      if (plants.length > 0) {
        setActivePlantId(plants[0].id);
        
        // Load history for the first plant immediately
        try {
          const history = await getPlantHistory(plants[0].id);
          setPlants(prev => prev.map(p => 
            p.id === plants[0].id 
              ? { ...p, history }
              : p
          ));
        } catch (error) {
          console.error('Error loading initial plant history:', error);
        }
      }
    }).catch(error => {
      console.error('Error loading plants:', error);
    });
  }, [user]); // Still depend on user to reload when auth state changes

  // Load history when active plant changes (but not on initial load)
  useEffect(() => {
    if (activePlant && plants.length > 0) {
      // Only load if this plant doesn't already have history loaded
      if (!activePlant.history || activePlant.history.length === 0) {
        getPlantHistory(activePlant.id).then(history => {
          setPlants(prev => prev.map(p => 
            p.id === activePlant.id 
              ? { ...p, history }
              : p
          ));
        }).catch(error => {
          console.error('Error loading plant history:', error);
        });
      }
    }
  }, [activePlant?.id]);

  // Simulate sensor updates
  useEffect(() => {
    if (!activePlant) return;

    const interval = setInterval(() => {
      setPlants(currentPlants =>
        currentPlants.map(p => {
          if (p.id !== activePlant.id) return p;

          const moistureChange = (Math.random() - 0.47); // Tend to dry out
          const lightChange = (Math.random() - 0.5) * 500;
          
          // Get current values with fallbacks
          const currentMoisture = typeof p.moisture === 'number' ? p.moisture : 50;
          const currentLight = typeof p.light === 'number' ? p.light : 12000;

          // Calculate max light value safely
          const maxLight = (() => {
            try {
              return CARE_THRESHOLDS[p.plantType]?.light?.high + 10000 || 30000;
            } catch {
              return 30000; // Default max light value if anything goes wrong
            }
          })();

          // Calculate new values with bounds
          const newMoisture = Math.max(0, Math.min(100, currentMoisture + moistureChange));
          const newLight = Math.max(0, Math.min(maxLight, currentLight + lightChange));

          return { ...p, moisture: newMoisture, light: newLight };
        })
      );
    }, 5000);

    // Add historical data every 30 seconds for demo purposes
    const historyInterval = setInterval(async () => {
      if (activePlant) {
        const currentPlant = plants.find(p => p.id === activePlant.id);
        if (currentPlant) {
          // Add both moisture and light readings
          await addSensorReading(activePlant.id, 'soil_moisture', currentPlant.moisture || 50);
          await addSensorReading(activePlant.id, 'light', currentPlant.light || 12000);
          
          // Reload history after adding new data
          try {
            const history = await getPlantHistory(activePlant.id);
            setPlants(prev => prev.map(p => 
              p.id === activePlant.id 
                ? { ...p, history }
                : p
            ));
          } catch (error) {
            console.error('Error reloading plant history:', error);
          }
        }
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(historyInterval);
    };
  }, [activePlant?.id]);

  const handleUpdatePlant = async (id: string, updates: Partial<Plant>) => {
    try {
      await updatePlant(id, updates);
      setPlants(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Failed to update plant:', error);
    }
  };

  const handleAddPlant = async (name: string, type: PlantType) => {
    try {
      // Always use PLAYFUL personality
      const newPlant = await createPlant(name, type, Personality.PLAYFUL);
      if (newPlant) {
        setPlants(prev => [...prev, newPlant]);
        setActivePlantId(newPlant.id);
      }
    } catch (error) {
      console.error('Failed to create plant:', error);
    }
  };

  const handleDeletePlant = async (id: string) => {
    try {
      await deletePlant(id);
      setPlants(prev => {
        const remaining = prev.filter(p => p.id !== id);
        if (activePlantId === id) {
          setActivePlantId(remaining[0]?.id || null);
        }
        return remaining;
      });
    } catch (error) {
      console.error('Failed to delete plant:', error);
    }
  };

  const careStatus = useMemo(() => {
    if (!activePlant) {
      return { advice: 'No Plant Selected', color: 'text-gray-400', icon: <SparklesIcon className="opacity-50" /> };
    }
    return getCareAdvice(activePlant.plantType, activePlant.moisture, activePlant.light);
  }, [activePlant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ECF0F3] flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LeafIcon className="text-green-400 h-10 w-10"/>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-teal-400">
                Symbiotek
              </h1>
            </div>
            <AuthButton />
          </div>
          <p className="mt-2 text-lg text-gray-400">Your AI-Powered Plant Companion</p>
        </header>

        {/* Plant Selector */}
        <nav className="mb-8 flex items-center justify-center gap-2 flex-wrap">
          {plants.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePlantId(p.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activePlantId === p.id 
                ? 'bg-green-500 text-white shadow-lg scale-105'
                : 'bg-gray-700/50 hover:bg-gray-600/70 text-gray-300'
              }`}
            >
              {p.name}
            </button>
          ))}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center w-9 h-9 bg-gray-700 hover:bg-green-700 rounded-full transition-colors text-green-300 hover:text-white"
            aria-label="Add new plant"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </nav>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activePlant ? (
            <>
              <div className="lg:col-span-2 space-y-8">
                <Dashboard 
                  plant={activePlant}
                  isLoading={isLoading[activePlant.id] || false}
                  careStatus={careStatus}
                />
                <HistoryChart data={activePlant.history} plantType={activePlant.plantType} />
              </div>
              <div className="lg:col-span-1 space-y-6">
                <PlantChat plant={activePlant} />
                <Card>
                  <h2 className="text-xl font-bold text-green-300 mb-4">Plant Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="plantName" className="block text-sm font-medium text-gray-300">
                        Plant&apos;s Name
                      </label>
                      <input
                        type="text"
                        id="plantName"
                        value={activePlant.name}
                        onChange={(e) => handleUpdatePlant(activePlant.id, { name: e.target.value })}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="plantType" className="block text-sm font-medium text-gray-300">
                        Plant Type
                      </label>
                      <select
                        id="plantType"
                        value={activePlant.plantType}
                        onChange={(e) => handleUpdatePlant(activePlant.id, { plantType: e.target.value as PlantType })}
                        className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        {Object.values(PlantType).map(pt => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete ${activePlant.name}? This cannot be undone.`)) {
                          handleDeletePlant(activePlant.id);
                        }
                      }}
                      className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 bg-red-900/50 hover:bg-red-900/80 rounded-lg py-2 transition-colors"
                    >
                      Delete {activePlant.name}
                    </button>
                  </div>
                </Card>
              </div>
            </>
          ) : (
            <div className="lg:col-span-3 text-center py-16">
              <h2 className="text-2xl font-bold text-gray-300">Welcome to Symbiotek!</h2>
              <p className="text-gray-400 mt-2 mb-6">You don&apos;t have any plants yet. Let&apos;s add your first one.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Add Plant
              </button>
            </div>
          )}
        </main>
      </div>
      
      <AddPlantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddPlant} 
      />
    </div>
  );
}