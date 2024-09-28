import { sample_foods } from "../data";

export const getAll = async () => sample_foods;

export const search = async(searchTerm: string) => sample_foods
.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())
);

export const getById= async (foodId:any) =>
    sample_foods.find(item=>item.id === foodId)