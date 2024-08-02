import { Box, useMantineTheme } from "@mantine/core";

export default function Main(props: any) {
  const theme = useMantineTheme();
  const { ...other } = props;

  const styles = {
    flexGrow: 1,
    padding: 0,
  };

  return <Box component="main" style={styles} {...other} />;
}
