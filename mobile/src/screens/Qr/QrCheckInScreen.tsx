import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppScreen } from "@/components/ui/AppScreen";
import { InfoCard } from "@/components/ui/InfoCard";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { colors } from "@/constants/theme";
import { qrCheckinService } from "@/services/qr-checkin.service";

export function QrCheckInScreen() {
  const queryClient = useQueryClient();

  const qrQuery = useQuery({
    queryKey: ["member", "qr-code"],
    queryFn: qrCheckinService.getMyQrCode,
  });

  const regenerateMutation = useMutation({
    mutationFn: qrCheckinService.regenerateMyQrCode,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["member", "qr-code"] });
    },
  });

  return (
    <AppScreen
      title="QR Check-In"
      subtitle="Present this QR code at the gym entrance scanner."
    >
      {qrQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : qrQuery.data ? (
        <InfoCard title="My QR Code">
          <View style={styles.qrContainer}>
            <QRCode value={qrQuery.data.qrCodeToken} size={220} />
          </View>

          <Text style={styles.text}>Token: {qrQuery.data.qrCodeToken}</Text>
          <Text style={styles.text}>
            Generated: {new Date(qrQuery.data.generatedAt).toLocaleString()}
          </Text>
          <Text style={styles.text}>
            Membership: {qrQuery.data.member.membershipStatus}
          </Text>

          <PrimaryButton
            onPress={() => {
              regenerateMutation.mutate();
            }}
            disabled={regenerateMutation.isPending}
          >
            {regenerateMutation.isPending ? "Regenerating..." : "Regenerate QR"}
          </PrimaryButton>
        </InfoCard>
      ) : (
        <Text style={styles.textMuted}>Unable to load your QR code.</Text>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 24,
  },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderRadius: 10,
  },
  text: {
    color: colors.text,
    fontSize: 14,
  },
  textMuted: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
