
import React from 'react';
import { Direction } from '../constants';
import { ArrowUpIcon, ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from './icons/ArrowIcons';

interface ControlsProps {
  onDirectionChange: (direction: Direction) => void;
  disabled?: boolean;
}

const ControlButton: React.FC<{ onClick: () => void; children: React.ReactNode, className?: string, disabled?: boolean }> = ({ onClick, children, className, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-3 sm:p-4 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);


const Controls: React.FC<ControlsProps> = ({ onDirectionChange, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-48 sm:w-60 mt-4 select-none">
      <div></div> {/* Top-left empty */}
      <ControlButton disabled={disabled} onClick={() => onDirectionChange(Direction.UP)} className="col-start-2">
        <ArrowUpIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </ControlButton>
      <div></div> {/* Top-right empty */}

      <ControlButton disabled={disabled} onClick={() => onDirectionChange(Direction.LEFT)}>
        <ArrowLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </ControlButton>
      <div></div> {/* Middle empty */}
      <ControlButton disabled={disabled} onClick={() => onDirectionChange(Direction.RIGHT)}>
        <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </ControlButton>

      <div></div> {/* Bottom-left empty */}
      <ControlButton disabled={disabled} onClick={() => onDirectionChange(Direction.DOWN)} className="col-start-2">
        <ArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </ControlButton>
      <div></div> {/* Bottom-right empty */}
    </div>
  );
};

export default Controls;
