import React from 'react';
import { FileText } from 'lucide-react';
import metadata from '../helper/metadata.json';

interface DocumentSelectionProps {
  selectedCountryCode: string | null;
  selectedDocumentType: string | null;
  onSelectDocumentType: (docType: string) => void;
  onNext: () => void;
}

const typeLabelMap: Record<string, string> = {
  PP: 'Passport',
  DL: 'Driving License',
  NI: 'National ID',
  AADHAAR: 'Aadhaar',
};

export const DocumentSelection: React.FC<DocumentSelectionProps> = ({
  selectedCountryCode,
  selectedDocumentType,
  onSelectDocumentType,
  onNext,
}) => {
  // Filter document types based on selected country code from metadata
  const documentTypes = React.useMemo(() => {
    if (!selectedCountryCode) return [];

    const docs = (metadata as { country_code: string; type: string; alternative_text: string }[])
      .filter((item) => item.country_code === selectedCountryCode)
      .map((item) => {
        const type = item.type || item.alternative_text || '';
        const label = typeLabelMap[type.toUpperCase()] || item.alternative_text || type;
        return {
          label,
          value: type,
        };
      });

    // Remove duplicates by value
    const uniqueDocs = Array.from(new Map(docs.map(doc => [doc.value.toLowerCase(), doc])).values());

    return uniqueDocs;
  }, [selectedCountryCode]);

  const handleDocumentSelect = (docType: string) => {
    onSelectDocumentType(docType);
    setTimeout(() => onNext(), 100);
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex justify-center">
          <img
            className="h-6"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center p-3 min-h-0 overflow-hidden">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Title Section */}
            <div className="bg-blue-600 px-4 py-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-white" />
              <h1 className="text-lg font-bold text-white mb-1">Select Document Type</h1>
              <p className="text-blue-100 text-xs">Choose the type of document you want to verify</p>
            </div>

            {/* Document Options */}
            <div className="p-4">
              {documentTypes.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500 text-sm">No document types available for the selected country.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documentTypes.map((docType) => (
                    <button
                      key={docType.value}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg text-left hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group focus:outline-none focus:ring-3 focus:ring-blue-200"
                      onClick={() => handleDocumentSelect(docType.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 text-sm">
                            {docType.label}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Verify your {docType.label.toLowerCase()}
                          </p>
                        </div>
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full group-hover:border-blue-500 transition-colors duration-200"></div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-center items-center gap-2">
          <span className="text-xs text-gray-500">Powered by</span>
          <img
            className="h-4"
            src="https://www.idmerit.com/wp-content/themes/idmerit/images/idmerit-logo.svg"
            alt="IDMerit Logo"
          />
        </div>
      </div>
    </div>
  );
};