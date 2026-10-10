import Image from "next/image";
import { ArrowRight } from "lucide-react";

/** Content for a Button: keeps link/button semantics at the call site. */
export function FeatureAction({ image, title, description }: {
  image: string;
  title: string;
  description: string;
}) {
  return <>
    <Image className="feature-action-art" src={image} alt="" width={72} height={72}/>
    <span className="feature-action-copy"><strong>{title}</strong><small>{description}</small></span>
    <span className="feature-action-arrow" aria-hidden="true"><ArrowRight/></span>
  </>;
}
