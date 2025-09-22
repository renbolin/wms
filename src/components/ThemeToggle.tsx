import React from 'react';
import { Button } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      type="text"
      icon={theme === 'dark' ? <BulbOutlined /> : <BulbFilled />}
      onClick={toggleTheme}
      className={className}
      title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    />
  );
};

export default ThemeToggle;