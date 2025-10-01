import prisma from "../db"


const seedDB = async () => {
    await prisma.user.create({
        data : {
            username : "@admin",
            email : "admin@gmail.com",
            password : "admin1234",
            role : "ADMIN"
        }
    })

    console.log("Admin Data Successfully Seeded");
}


seedDB()