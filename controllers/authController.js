import tokenGeneration from "../config/token.js"
import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import SibApiV3Sdk from "sib-api-v3-sdk";
import dotenv from 'dotenv'

// signUp===register 
export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body
        

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists!' })
        }

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        })

        // tokn generated for signed up user
        const token = await tokenGeneration(user._id)
        // storing token in cookies
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'Strict'
        })
        return res.status(201).json({ message: 'User created successfully', user ,token})
      

    } catch (error) {
        res.status(500)
        res.json({ message: `SignUp error: ${error}` })
    }
}

// signIn===Login
export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400)
            res.json({ message: 'All fields required' })
            return
        }

        const user = await User.findOne({ email })
        if (!user) {
            res.status(401).json({ message: 'User not found' })
        }

        // password match
        const ispasswordMatch = await bcrypt.compare(password, user.password)
        if (!ispasswordMatch) {
           return res.status(401).json({ message: 'Unauthorized user credentials!' })
        }

        // tokn generated for signed in user
        const token = await tokenGeneration(user._id)
        // storing token in cookies
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 10 * 365 * 24 * 60 * 60 * 1000,
            secure: false,
            sameSite: 'Strict'
        })
        return res.status(200).json({ message: 'User Signed in successfully', user,token })

    } catch (error) {
        res.status(500)
        res.json({ message: `SignedIn error:${error}` })
    }
}

// signOut===Log Out
export const signOut = async (req, res) => {
    try {
        res.clearCookie('token')
        return res.status(200).json({ message: 'User signed Out successfully!' })
    } catch (error) {
        res.status(500)
        res.json({ message: `SignOUT error:${error}` })
    }
}

// forgotPassword
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    console.log("Forgot password email received:", cleanEmail);

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({ message: "Email not found" });
    }

    const token = Math.random().toString(36).slice(-8);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    // respond immediately
    res.json({
      message: "Reset link has been sent via email.",
    });

    // ===== BREVO EMAIL (background) =====
    setImmediate(async () => {
      try {
        const resetLink = `${process.env.FRONTEND_URL}/resetPassword/${token}`;
        console.log("RESET PASSWORD LINK:", resetLink);

        // Brevo config
        const client = SibApiV3Sdk.ApiClient.instance;
        client.authentications["api-key"].apiKey =
          process.env.BREVO_API_KEY;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        await apiInstance.sendTransacEmail({
          sender: {
            email: process.env.BREVO_SENDER_EMAIL,
            name: process.env.BREVO_SENDER_NAME,
          },
          to: [
            {
              email: user.email,
            },
          ],
          subject: "Reset your password",
          htmlContent: `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link expires in 10 minutes.</p>
          `,
        });

        console.log("RESET PASSWORD EMAIL SENT (BREVO)");
      } catch (emailErr) {
        console.error("BREVO EMAIL ERROR:", emailErr);
      }
    });

  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
  }
}

// resetPAssword
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmPassword } = req.body;

    // validation
    if (!newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "All fields are required" });
    }
    

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Passwords do not match" });
    }

    // find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful. Please login again.",
      // user: { password: user.password, email: user.email }
    });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
}

