import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Briefcase, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
    setErrors({ ...errors, role: '' });
  };

  const validatePassword = (password) => {
    setPasswordValidation({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';

    // Validate password strength
    const isPasswordValid = Object.values(passwordValidation).every(v => v);
    if (!isPasswordValid) {
      newErrors.password = 'Password does not meet all requirements';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create user
    const newUser = {
      ...formData,
      id: `${formData.role.toUpperCase().substring(0, 3)}${Math.floor(Math.random() * 1000)}`,
      signupDate: new Date().toISOString().split('T')[0],
      pronouns: '',
      jobTitle: '',
      about: ''
    };

    localStorage.setItem('fosys_user', JSON.stringify(newUser));
    toast.success('Account created successfully!');
    navigate(`/dashboard/${newUser.role}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/assets/logo.jpg" alt="FOSYS" className="h-12 w-12 rounded-lg" />
            <span className="text-3xl font-bold text-white" style={{fontFamily: 'Work Sans'}}>FOSYS</span>
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome!</h2>
          <p className="text-slate-400">Create your workspace account</p>
        </div>

        {/* Signup Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-xl border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    data-testid="signup-name-input"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    data-testid="signup-email-input"
                    placeholder="your.email@fosys.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-200">Role</Label>
                <Select onValueChange={handleRoleChange} value={formData.role}>
                  <SelectTrigger data-testid="signup-role-select" className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="intern" className="text-white">Intern</SelectItem>
                    <SelectItem value="employee" className="text-white">Employee</SelectItem>
                    <SelectItem value="manager" className="text-white">Manager</SelectItem>
                    <SelectItem value="admin" className="text-white">Admin</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-slate-200">Department</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="department"
                    name="department"
                    data-testid="signup-department-input"
                    placeholder="Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    data-testid="signup-password-input"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    data-testid="signup-confirm-password-input"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Password Validation */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
              <p className="text-slate-300 text-sm font-medium mb-3">Password must contain:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${passwordValidation.minLength ? 'text-emerald-500' : 'text-slate-600'}`} />
                  <span className={`text-sm ${passwordValidation.minLength ? 'text-emerald-500' : 'text-slate-400'}`}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasUpperCase ? 'text-emerald-500' : 'text-slate-600'}`} />
                  <span className={`text-sm ${passwordValidation.hasUpperCase ? 'text-emerald-500' : 'text-slate-400'}`}>One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasLowerCase ? 'text-emerald-500' : 'text-slate-600'}`} />
                  <span className={`text-sm ${passwordValidation.hasLowerCase ? 'text-emerald-500' : 'text-slate-400'}`}>One lowercase letter</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasNumber ? 'text-emerald-500' : 'text-slate-600'}`} />
                  <span className={`text-sm ${passwordValidation.hasNumber ? 'text-emerald-500' : 'text-slate-400'}`}>One number</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${passwordValidation.hasSpecialChar ? 'text-emerald-500' : 'text-slate-600'}`} />
                  <span className={`text-sm ${passwordValidation.hasSpecialChar ? 'text-emerald-500' : 'text-slate-400'}`}>One special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              data-testid="signup-submit-btn"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                data-testid="login-link"
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;