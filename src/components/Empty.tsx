import React from 'react';
import { Empty as AntEmpty } from 'antd';
import { EmptyProps } from 'antd/es/empty';

interface CustomEmptyProps extends EmptyProps {
  description?: React.ReactNode;
  image?: string;
}

const Empty: React.FC<CustomEmptyProps> = ({ 
  description = '暂无数据', 
  image = AntEmpty.PRESENTED_IMAGE_SIMPLE,
  ...props 
}) => {
  return (
    <div className="flex items-center justify-center p-8 w-full">
      <AntEmpty
        description={description}
        image={image}
        {...props}
      />
    </div>
  );
};

export default Empty;