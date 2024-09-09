import Image from 'next/image'
 
export function Avatar({ id, alt }) {
  return <Image src={`/images/${id}.png`} alt={alt} width="64" height="64" />
}
 
export function Backgound() {
  return <Avatar id="loginBackground" alt="Record Player" />
}