import db from '../db.js';
class User{

    constructor(id, username, email,password,createdAt){
        this.__id=id;
        this.__username=username;
        this.__email=email;
        this.__password=password;
        this.__createdAt=createdAt;
    }

    getId(){
        return this.__id;
    }
    getUsername(){
        return this.__username;
    }

    getEmail(){
        return this.__email;
    }

    getPassword(){
        return this.__password;
    }

    static create(username,email,password,callback){
        const sql="INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        db.query(sql, [username, email, password], callback);
    }

    static findByEmail(email,callback){
        const sql="SELECT * FROM users WHERE email=?";
        db.query(sql,[email],(err,res)=>{

            if(err) return callback(err);
            if(res.length==0) return callback(null,null);


            const u = res[0];
            const user = new User(u.id, u.username, u.email, u.password_hash, u.created_at);
            callback(null, user);
        });
    }

    static findByUsername(username,callback){
        const sql="SELECT * FROM users WHERE username=?";
        db.query(sql,[username],(err,res)=>{
            if(err) return callback(err);
            if(res.length==0) return callback(null,null);

            const u=res[0];
            const user = new User(u.id, u.username, u.email, u.password_hash, u.created_at);
            callback(null, user);
        });
    }
}

export default User;
