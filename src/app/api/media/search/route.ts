import {mediaRoute} from '@/server/media/route';
export const dynamic='force-dynamic';
export async function POST(request:Request){return mediaRoute(request,'search');}
