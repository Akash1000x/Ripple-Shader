import * as React from "react";
export default function useMouse() {
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });

  const mouseMove = (e) => {
    const { clientX, clientY } = e;
    setMouse({
      x: clientX,
      y: clientY,
    });
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", mouseMove);
    return () => {
      window.removeEventListener("mousemove", mouseMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mouse;
}