const driveQueryPrefixes = [
  ["drive"],
  ["files"],
  ["folders"],
  ["search"],
  ["shares"],
  ["public-share"],
];

export const invalidateDriveQueries = (queryClient) =>
  Promise.all(
    driveQueryPrefixes.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
