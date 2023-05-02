import { useCallback, useEffect, useState, useRef } from "react";

const useHover = () => {
  const [state, setState] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const handleMouseOver = useCallback(() => setState(true), []);
  const handleMouseOut = useCallback(() => setState(false), []);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener("mouseover", handleMouseOver);
    element.addEventListener("mouseout", handleMouseOut);
   
	// useEffect에서 이벤트를 등록할 때는
    // 꼭 정리(clean-up)를 해줘야한다.
    return () => {
      element.removeEventListener("mouseover", handleMouseOver);
      element.removeEventListener("mouseout", handleMouseOut);
    };
    // 위에서 handleMouseOver, handleMouseOut useCallback을 통해 메모리제이션을 이용하여
    // 의존성에 굳이 넣어줄 필요가 없지만 추후에 생성되는 로직이나 이벤트에서 handle 관련 함수 로직이 
    // 바뀔 가능성을 염두해서 의존성에 넣어준다.
  }, [ref, handleMouseOver, handleMouseOut]);

  return {ref:ref,state:state};
};

export default useHover;