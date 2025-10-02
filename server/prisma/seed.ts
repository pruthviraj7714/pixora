import prisma from "../db"

const seedDB = async () => {
    await prisma.user.deleteMany({where : {role : "ADMIN"}})
    await prisma.user.create({
        data : {
            username : "@admin",
            email : "admin@gmail.com",
            password : "$2a$10$2V1tOBnhBgRAcvN0sHYbvewXdGaKe/JtFjXxXzcjAg.IWTyIyMoiO",
            role : "ADMIN",
            firstname : "admin",
            lastname : "admin"
        }
    })

    console.log("Admin Data Successfully Seeded");
}


seedDB()