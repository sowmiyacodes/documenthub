const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required"
            });
        }

        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !data) {
            return res.status(401).json({
                message: "Invalid Email"
            });
        }

        const validPassword = await bcrypt.compare(password, data.password);

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(
            {
                id: data.id,
                email: data.email,
                role: data.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.status(200).json({

            message: "Login Successful",

            token,

            user: {
                id: data.id,
                full_name: data.full_name,
                email: data.email,
                role: data.role
            }

        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};



exports.register = async (req, res) => {
    try {

        const { full_name, email, password } = req.body;

        // Validate input
        if (!full_name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Check if email already exists
        const { data: existingUser } = await supabase
            .from("users")
            .select("email")
            .eq("email", email)
            .maybeSingle();

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const { data, error } = await supabase
            .from("users")
            .insert([
                {
                    full_name,
                    email,
                    password: hashedPassword,
                    role: "USER"
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(500).json({
                message: error.message
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: data.id,
                email: data.email,
                role: data.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "24h"
            }
        );

        res.status(201).json({
            message: "Registration Successful",
            token,
            user: {
                id: data.id,
                full_name: data.full_name,
                email: data.email,
                role: data.role
            }
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }
};