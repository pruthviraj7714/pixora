"use client"
import { useSession } from "next-auth/react";


const HomePage = () => {

    const { data } = useSession();

    return (
        <div>
            Home Page
        </div>
    )

}


export default HomePage;