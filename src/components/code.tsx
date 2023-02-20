const Header = ({v2, ...props}) => {
  const search = useSearch(props, v2);
  const events = useEvents(v2);

  return (
    <>
      <Navigation v2={v2} events={events}/>
      <Search v2={v2} search={seach}/>
      <SideBar v2={v2}/>
      <Promo v2={v2}/>
    </>
  )
}