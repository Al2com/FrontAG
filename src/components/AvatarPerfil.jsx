const AvatarPerfil = ({ usuario, className }) => (
    <img
        className={className}
        src={usuario?.foto_perfil_thumb_url || '/usuario.png'}
        alt="Foto de perfil"
    />
)

export default AvatarPerfil
