'use client';

import { useState } from 'react';
import { createPlant } from '@/lib/plant-data';

interface AddPlantFormProps {
  onPlantCreated: () => void;
}

export default function AddPlantForm({ onPlantCreated }: AddPlantFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [plantType, setPlantType] = useState('1'); // Default to Monstera

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const plant = await createPlant(plantName, parseInt(plantType));
      setIsOpen(false);
      setPlantName('');
      onPlantCreated();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error('Error in form submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
      >
        + Add New Plant
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Add New Plant</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="plantName" className="block text-sm font-medium text-gray-700 mb-1">
            Plant Name
          </label>
          <input
            type="text"
            id="plantName"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., My Monstera"
            required
          />
        </div>
        
        <div>
          <label htmlFor="plantType" className="block text-sm font-medium text-gray-700 mb-1">
            Plant Type
          </label>
          <select
            id="plantType"
            value={plantType}
            onChange={(e) => setPlantType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="1">Monstera</option>
            <option value="2">Cactus</option>
            <option value="3">Snake Plant</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setError(null);
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Add Plant'}
          </button>
        </div>
      </form>
    </div>
  );
}
