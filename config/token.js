import jwt from 'jsonwebtoken'


const tokenGeneration=async(userId)=>{
    try {
        const token=await jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:'1y'})
        return token
    } catch (error) {
        return res.status(500).json({message:`token generation error:${error}`})
    }
}

export default tokenGeneration