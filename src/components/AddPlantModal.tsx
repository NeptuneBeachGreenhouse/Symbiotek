import { useState } from 'react';
import { PlantType } from '@/types';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, type: PlantType) => void;
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('My New Plant');
  const [type, setType] = useState(PlantType.TROPICAL);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(name, type);
    onClose();
    setName('My New Plant'); // Reset for next time
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-green-300 mb-4">Add a New Plant</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPlantName" className="block text-sm font-medium text-gray-300">
              Plant's Name
            </label>
            <input 
              id="newPlantName" 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500" 
            />
          </div>
          <div>
            <label htmlFor="newPlantType" className="block text-sm font-medium text-gray-300">
              Plant Type
            </label>
            <select 
              id="newPlantType" 
              value={type} 
              onChange={e => setType(e.target.value as PlantType)} 
              className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              {Object.values(PlantType).map(pt => (
                <option key={pt} value={pt}>{pt}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-500 transition-colors"
            >
              Add Plant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
