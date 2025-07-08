import React from 'react';
import { Globe } from 'lucide-react';
import metadata from '../helper/metadata.json';

interface CountrySelectionProps {
  selectedCountryCode: string | null;
  onSelectCountryCode: (countryCode: string) => void;
  onNext: () => void;
}

export const CountrySelection: React.FC<CountrySelectionProps> = ({
  selectedCountryCode,
  onSelectCountryCode,
  onNext,
}) => {
  // Extract unique countries with country_code and country name
  const countries = Array.from(
    new Map(
      (metadata as { country: string; country_code: string }[]).map((item) => [
        item.country_code,
        item.country,
      ])
    ).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]));

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onSelectCountryCode(value);
    if (value) {
      setTimeout(() => onNext(), 100);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white p-3">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-center">
            <img
              className="h-8"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-blue-600 px-4 py-4 text-center">
          <Globe className="w-8 h-8 mx-auto mb-2 text-white" />
          <h1 className="text-lg font-bold text-white mb-1">Select Your Country</h1>
          <p className="text-blue-100 text-xs">Choose your country to continue verification</p>
        </div>

        {/* Selection Section */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country of Document
            </label>
            <select
              className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg text-gray-900 font-medium focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white text-sm"
              value={selectedCountryCode || ''}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select a country
              </option>
              {countries.map(([code, name]) => (
                <option key={code} value={code} className="py-2">
                  {name}
                </option>
              ))}
            </select>
          </div>

          {selectedCountryCode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-800 font-medium text-xs">
                  Country selected: {countries.find(([code]) => code === selectedCountryCode)?.[1]}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-3">
          <div className="flex justify-center items-center gap-2">
            <span className="text-xs text-gray-500">Powered by</span>
            <img
              className="h-6"
              src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
              alt="IDMerit Logo"
            />
          </div>
        </div>
      </div>
    </div>
  );
};