import { Upload } from 'lucide-react';
import { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export const FileUpload = ({ onFileSelect, isProcessing }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isXLSX = fileName.endsWith('.xlsx');
    const isXLS = fileName.endsWith('.xls');

    if (isCSV || isXLSX || isXLS) {
      onFileSelect(file);
    } else {
      alert('Por favor, selecione um arquivo CSV ou XLSX válido.');
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        dragActive
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400 bg-white'
      } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept=".csv,.xlsx,.xls"
        onChange={handleChange}
        disabled={isProcessing}
      />

      <label
        htmlFor="file-upload"
        className="cursor-pointer flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>

        <div>
          <p className="text-lg font-semibold text-gray-700 mb-1">
            {isProcessing ? 'Processando...' : 'Arraste sua planilha aqui'}
          </p>
          <p className="text-sm text-gray-500">
            ou clique para selecionar (CSV ou XLSX)
          </p>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          <p>A planilha deve conter as colunas:</p>
          <p className="font-medium mt-1">Nome da Empresa | Cidade | Estado (opcional) | Categoria (opcional)</p>
        </div>
      </label>
    </div>
  );
};
