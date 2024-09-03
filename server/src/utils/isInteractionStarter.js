function isInteractionStarter(interaction) {
  return (interaction.member?.user ?? interaction.user).id === interaction.message.interaction_metadata.user.id;
}

export default isInteractionStarter;
export { isInteractionStarter }
