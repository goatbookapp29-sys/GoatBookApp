const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const { hashPassword, comparePassword } = require('../utils/password');
const { Resend } = require('resend');
const { v4: uuidv4 } = require('uuid');

const resend = new Resend(process.env.RESEND_API_KEY);

// @desc    Owner Registration Flow (Email + Password)
// @route   POST api/auth/register
exports.register = async (req, res) => {
  const { name, email, password, farmName, farmLocation } = req.body;

  if (!email || !password || !name || !farmName) {
    return res.status(400).json({ message: 'Name, email, password, and farm name are required' });
  }

  try {
    // 1. Check if user already exists by email
    const userExists = await prisma.users.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();

    // Use a transaction for the entire registration flow
    const result = await prisma.$transaction(async (tx) => {
      // 2. Create User
      const user = await tx.users.create({
        data: {
          id: uuidv4(),
          name,
          email,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now
        }
      });

      // 3. Create Employee record with type OWNER
      const employee = await tx.employees.create({
        data: {
          id: uuidv4(),
          user_id: user.id,
          employee_type: 'OWNER',
          created_by_user_id: user.id,
          created_at: now,
          updated_at: now
        }
      });

      // 4. Create Farm
      const farm = await tx.farms.create({
        data: {
          id: uuidv4(),
          name: farmName,
          location: farmLocation || null,
          owner_employee_id: employee.id,
          created_by_user_id: user.id,
          created_at: now,
          updated_at: now
        }
      });

      // 5. Link Owner to Farm
      await tx.farm_employees.create({
        data: {
          id: uuidv4(),
          farm_id: farm.id,
          employee_id: employee.id,
          created_by_user_id: user.id,
          created_at: now,
          updated_at: now
        }
      });

      return { user, farm };
    });

    const token = jwt.sign(
      { id: result.user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '365d' }
    );

    res.status(201).json({
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email
      },
      farm: {
        id: result.farm.id,
        name: result.farm.name
      }
    });

  } catch (err) {
    console.error('REGISTRATION ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// @desc    Email-only Login Flow
// @route   POST api/auth/login
exports.login = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: identifier },
      include: {
        employees: {
          include: {
            farm_employees: {
              include: {
                farms: true
              }
            }
          }
        }
      }
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const employeeProfile = user.employees?.[0];

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '365d' }
    );

    // Extract farms from the employee -> farm_employees -> farms chain
    const farms = employeeProfile?.farm_employees?.map(fe => fe.farms) || [];

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: employeeProfile?.employee_type || 'OWNER'
      },
      farms
    });

  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Forgot Password - Send 6-digit code
// @route   POST api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.users.findUnique({ where: { email } });

    if (!user) {
      console.log(`FORGOT PASSWORD: User not found for email ${email}`);
      return res.status(200).json({ message: 'If an account exists with this email, a reset code has been sent.' });
    }

    console.log(`FORGOT PASSWORD: User found for email ${email}, generating code...`);

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set token and expiry (1 hour)
    await prisma.users.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetCode,
        resetPasswordExpires: new Date(Date.now() + 3600000),
        updatedAt: new Date()
      }
    });

    // Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: 'GoatBook <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset Code - GoatBook',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF5A0F;">Password Reset</h2>
          <p>You requested a password reset for your GoatBook account.</p>
          <p>Your password reset code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333;">
            ${resetCode}
          </div>
          <p>This code will expire in 1 hour.</p>
          <p>If you did not request this, please ignore this email.</p>
          <br />
          <p>Thanks,</p>
          <p>The GoatBook Team</p>
        </div>
      `
    });

    if (error) {
      console.error('RESEND ERROR:', error);
      return res.status(500).json({ message: 'Failed to send email via Resend', error });
    }

    console.log('RESEND SUCCESS:', data);

    res.status(200).json({ message: 'Reset code sent to your email' });

  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Reset Password
// @route   POST api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are required' });
  }

  try {
    const user = await prisma.users.findFirst({
      where: {
        email,
        resetPasswordToken: code
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid code or email' });
    }

    // Check if code is expired
    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date()
      }
    });

    res.status(200).json({ message: 'Password reset successful. You can now login.' });

  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};
