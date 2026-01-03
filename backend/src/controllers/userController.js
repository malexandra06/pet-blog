import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const register = (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.render("register", { error: "Toate câmpurile sunt obligatorii!" });
  }

  User.findByUsername(username, (err, existingUser) => {
    
    if (err) {
      return res.render("register", { error: "Error checking username!" });
    }
    
    if (existingUser) {
      return res.render("register", { error: "Username already exists!" });
    }
    User.findByEmail(email, (err, existingEmail) => {
      
      if (err) {
        return res.render("register", { error: "Error checking email" });
      }
      
      if (existingEmail) {
        return res.render("register", { error: "Email already exists!" });
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      User.create(username, email, passwordHash, (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.render("register", { error: "Username or email already used!" });
          }
          return res.render("register", { error: "Server error!" });
        }
        res.redirect("/login");
      });
    });
  });
};

export const login = (req, res) => {
  const { field, password } = req.body;

  if (!field || !password) {
    return res.render("login", { error: "Toate câmpurile sunt obligatorii!" });
  }

  User.findByEmail(field, (err, user) => {
    if (err) return res.render("login", { error: "Server error!" });

    const handleUser = (user) => {
      if (!user) {
        return res.render("login", { error: "This user doesn't exist!" });
      }

      const isMatch = bcrypt.compareSync(password, user.getPassword());
      if (!isMatch) {
        return res.render("login", { error: "Wrong password!" });
      }

      req.session.user = {
        id: user.getId(),
        username: user.getUsername(),
        email: user.getEmail(),
      };

      req.session.lastActivity = Date.now();

      req.session.save((err) => {
        if (err) {
          return res.render("login", { error: "Server error!" });
        }

        return res.redirect("/");
      });
    };

    if (!user) {
      User.findByUsername(field, (err, user) => {
        if (err) return res.render("login", { error: "Server error!" });
        handleUser(user);
      });
    } else {
      handleUser(user);
    }
  });
};