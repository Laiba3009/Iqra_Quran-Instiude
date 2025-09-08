import React from 'react';
export function Card({className='', children}:{className?:string, children:React.ReactNode}){
  return <div className={`bg-white border rounded-xl p-4 ${className}`}>{children}</div>;
}
export function CardHeader({children}:{children:React.ReactNode}){ return <div className="mb-2">{children}</div>; }
export function CardTitle({children}:{children:React.ReactNode}){ return <h3 className="font-semibold text-lg">{children}</h3>; }
export function CardContent({children}:{children:React.ReactNode}){ return <div>{children}</div>; }
