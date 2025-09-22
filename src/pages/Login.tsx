import React from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface LoginFormValues {
  username: string;
  password: string;
  remember: boolean;
}

const Login: React.FC = () => {
  const navigate = useNavigate();

  const onFinish = (values: LoginFormValues) => {
    console.log('登录信息:', values);
    
    // 模拟登录验证
    if (values.username === 'admin' && values.password === 'admin123') {
      // 设置登录状态
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', values.username);
      
      message.success('登录成功！');
      navigate('/dashboard');
    } else {
      message.error('用户名或密码错误！');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card 
        title="React Admin 系统登录" 
        className="w-full max-w-md shadow-lg"
        styles={{ header: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' } }}
      >
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
          className="max-w-md"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="用户名: admin" 
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码: admin123"
            />
          </Form.Item>
          
          <Form.Item>
            <div className="flex justify-between">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <a className="text-blue-500 hover:text-blue-700" href="#">
                忘记密码?
              </a>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;