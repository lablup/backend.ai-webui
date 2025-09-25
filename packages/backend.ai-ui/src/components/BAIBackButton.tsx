import { Button } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';

export interface BAIBackButtonProps {
  to: To;
  options?: NavigateOptions;
}

const BAIBackButton = ({ to, options }: BAIBackButtonProps) => {
  const navigate = useNavigate();
  return (
    <Button
      type="text"
      icon={<ArrowLeft size={18} />}
      onClick={() => navigate(to, options)}
    />
  );
};

export default BAIBackButton;
