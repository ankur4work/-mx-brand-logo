import React from "react";
import { useAppQuery } from "../hooks"; // Replace with your actual hook location

export function TotalWishlists() {
    const { data, isLoading, error } = useAppQuery({
        url: "/api/total-wishlists",
    });

    if (isLoading) return <div>Loading Total Wishlists...</div>;
    if (error) return <div>Error fetching total wishlists: {error.message}</div>;

    return (
        <div>
            <h3>Total Wishlists</h3>
            <p>{data?.totalWishlists ?? 0}</p>
        </div>
    );
}
