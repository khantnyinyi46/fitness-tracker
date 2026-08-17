import UpdateForm from "../../ui/update-form";

export default async function UpdatePage({ params }: { params: { id: string } }) {
    const { id } = await params
    return <UpdateForm id={id} />;
}
