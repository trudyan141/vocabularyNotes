import {searchRanges} from '@/lib/learning/library-search';
export function SearchHighlight({text,query}:{text:string;query:string}){
 const ranges=searchRanges(text,query);if(!ranges.length)return <>{text}</>;
 const parts=[];let cursor=0;
 for(const [start,end] of ranges){if(start<cursor)continue;parts.push(text.slice(cursor,start),<mark className="search-highlight" key={start}>{text.slice(start,end)}</mark>);cursor=end;}
 parts.push(text.slice(cursor));return <>{parts}</>;
}
