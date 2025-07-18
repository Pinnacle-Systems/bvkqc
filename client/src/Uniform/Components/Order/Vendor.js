import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSizeTableMasterByReferenceQuery } from '../../../redux/uniformService/SizeTableMasterService';
import { toast } from 'react-toastify';

const SizeTableDetail = () => {
  const { reference } = useParams();
  const { data, isLoading, error } = useGetSizeTableMasterByReferenceQuery(reference);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load size table data');
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              Failed to load size table data. Please try again later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return <div className="text-center py-8">No size table data found</div>;
  }

  const { product, measurements, availableSizes } = data.data;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">{product.name}</h2>
        <p className="text-gray-600">{product.reference}</p>
        {product.description && (
          <p className="text-gray-500 text-sm mt-1">{product.description}</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Measurement
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Dimension
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                Tolerance
              </th>
              {availableSizes.map(size => (
                <th 
                  key={size} 
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border"
                >
                  Size {size}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {measurements.map(measurement => (
              <tr key={measurement.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border">
                  {measurement.description}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">
                  {measurement.dimension || '-'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 border">
                  {measurement.toleranceMin && measurement.toleranceMax 
                    ? `${measurement.toleranceMin} to ${measurement.toleranceMax}` 
                    : '-'}
                </td>
                {availableSizes.map(size => {
                  const valueObj = measurement.values.find(v => v.size === size);
                  return (
                    <td 
                      key={`${measurement.id}-${size}`} 
                      className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-center border"
                    >
                      {valueObj ? valueObj.value : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Measurement Notes</h3>
          <ul className="mt-2 text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>All measurements are in centimeters unless otherwise specified</li>
            <li>Tolerances indicate acceptable variation from specified measurements</li>
            <li>Measurements taken according to standard industry practices</li>
          </ul>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800">Size Availability</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableSizes.map(size => (
              <span 
                key={`available-${size}`}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                Size {size}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeTableDetail;