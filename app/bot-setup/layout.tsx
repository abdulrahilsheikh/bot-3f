import React, { PropsWithChildren, Suspense } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return <Suspense>{children}</Suspense>;
};

export default Layout;
