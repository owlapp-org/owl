import { Loader } from "@mantine/core";

const ContentLoading = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 84px)",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Loader type="bars" />
    </div>
  );
};

export default ContentLoading;
