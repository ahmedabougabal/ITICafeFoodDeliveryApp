import React from 'react'

interface TitleProps{
    title:string;
    fontSize?:string;
    margin?:string;
}

export const Title : React.FC<TitleProps>= function({title,fontSize,margin}) {
  return (
    <h1 style={{fontSize,margin,color:'#616161'}}>
        {title}
    </h1>
  )
}
