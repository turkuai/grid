import { Plus } from 'lucide-react';

type PlusButtonProps = {
  onClick: () => void;
  title?: string;
};

export default function PlusButton({ onClick, title = 'Add' }: PlusButtonProps) {
  return (
    <button type="button" className="server-grid-add-button" title={title} aria-label={title} onClick={onClick}>
      <Plus size={20} />
    </button>
  );
}
